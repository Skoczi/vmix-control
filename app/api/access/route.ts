import {accessControl} from '@/lib/access-control';
export async function GET(request:Request){return accessControl.handle(request);}
export async function POST(request:Request){return accessControl.handle(request);}
