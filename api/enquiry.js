import { createHash } from 'node:crypto';
const RECIPIENT='nickooi42a123@gmail.com';
const SITE='https://jw-business-solutions.vercel.app';
// Existing owner-controlled Vercel mail service; provider credentials remain there.
const MAIL_SERVICE='https://jw-consulting-noir.vercel.app/api/enquiry';
const SERVICES=new Set(['Business strategy','AI & automation','Web & mobile solutions','Systems integration','Let’s explore together']);
const respond=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...(status===405?{Allow:'POST'}:{})}});
export async function handleEnquiry(request,send=fetch,apiKey=process.env.RESEND_API_KEY){
 if(request.method!=='POST')return respond({ok:false,error:'Please submit the enquiry form.'},405);
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin&&origin!==SITE)return respond({ok:false,error:'Please submit the form on our website.'},403);
 if(!(request.headers.get('content-type')||'').includes('application/json'))return respond({ok:false,error:'Invalid content type.'},415);
 let data;try{const text=await request.text();if(text.length>12000)return respond({ok:false,error:'Your message is too long.'},413);data=JSON.parse(text)}catch{return respond({ok:false,error:'Invalid form data.'},400)}
 if(!data||typeof data!=='object'||Array.isArray(data))return respond({ok:false,error:'Invalid form data.'},400);
 if(data.website)return respond({ok:true});
 const clean=key=>typeof data[key]==='string'?data[key].trim():'';
 const name=clean('name'),email=clean('email'),company=clean('company'),service=clean('service'),message=clean('message'),submissionId=clean('submissionId');
 if(name.length<2||name.length>100||/[\r\n]/.test(name)||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||company.length>150||!SERVICES.has(service)||message.length<15||message.length>3500||data.consent!==true||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId))return respond({ok:false,error:'Please check your details, select a service, and agree to being contacted.'},400);
 try{
  let upstream,result;
  if(apiKey){
   const digest=createHash('sha256').update(JSON.stringify({name,email,company,service,message,submissionId})).digest('hex');
   upstream=await send('https://api.resend.com/emails',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`,'Idempotency-Key':`jw-business-${digest}`},body:JSON.stringify({from:process.env.ENQUIRY_FROM||'JW Consulting <onboarding@resend.dev>',to:[RECIPIENT],reply_to:email,subject:`JW Consulting enquiry — ${service}`,text:`Name: ${name}\nEmail: ${email}\nCompany: ${company||'Not supplied'}\nService: ${service}\n\n${message}\n\nSource: ${SITE}\nConsent to contact: Yes\nReference: ${submissionId}`}),signal:AbortSignal.timeout(22000)});
   result=await upstream.json();if(upstream.ok&&!result.id)throw new Error('Missing delivery ID');
  }else{
   upstream=await send(MAIL_SERVICE,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,company,service:'Not sure yet',message:`BUSINESS SOLUTIONS ENQUIRY\nSource: ${SITE}\nSelected service: ${service}\n\n${message}`,consent:true,submissionId}),signal:AbortSignal.timeout(25000)});
   result=await upstream.json();if(upstream.ok&&result.ok!==true)throw new Error('Delivery not confirmed');
  }
  if(!upstream.ok){console.error('enquiry_delivery_failed',{status:upstream.status});return respond({ok:false,error:'We couldn’t send your enquiry just now. Please try again or email nickooi42a123@gmail.com.'},upstream.status===429?429:502)}
  console.info('enquiry_sent',{reference:submissionId,route:apiKey?'direct':'shared-mail-service'});
  return respond({ok:true});
 }catch(error){console.error('enquiry_delivery_error',{type:error.name});return respond({ok:false,error:'We couldn’t confirm email delivery. Please try again or email nickooi42a123@gmail.com.'},502)}
}
export default {fetch:request=>handleEnquiry(request)};
