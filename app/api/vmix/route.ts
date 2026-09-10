import {accessControl} from '@/lib/access-control';
import { handleVmix } from '@/lib/vmix-proxy';
export async function POST(request: Request) { return await accessControl.guard(request)||handleVmix(request); }

export async function GET(request:Request){return await accessControl.guard(request)||handleVmix(request);}
