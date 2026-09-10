import {randomBytes,timingSafeEqual} from 'node:crypto';
import type {IncomingMessage} from 'node:http';
const header='x-vmix-local-access';
export function markLocalRequest(request:IncomingMessage){
 delete request.headers[header];
 if(request.rawHeaders){for(let i=request.rawHeaders.length-2;i>=0;i-=2)if(request.rawHeaders[i].toLowerCase()===header)request.rawHeaders.splice(i,2);}
 const address=request.socket.remoteAddress;
 if(address==='127.0.0.1'||address==='::1'||address==='::ffff:127.0.0.1'){
  process.env.VMIX_INTERNAL_LOCAL_TOKEN ||= randomBytes(32).toString('hex');
  request.headers[header]=process.env.VMIX_INTERNAL_LOCAL_TOKEN;
  request.rawHeaders?.push(header,process.env.VMIX_INTERNAL_LOCAL_TOKEN);
 }
}
export function isLocalRequest(request:Request){
 const expected=process.env.VMIX_INTERNAL_LOCAL_TOKEN,actual=request.headers.get(header);
 return !!expected&&!!actual&&/^[a-f0-9]{64}$/.test(actual)&&actual.length===expected.length&&timingSafeEqual(Buffer.from(actual),Buffer.from(expected));
}
