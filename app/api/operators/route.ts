import {accessControl} from '@/lib/access-control';
import {handlePresence} from '@/lib/operator-presence';
export async function POST(request:Request){return await accessControl.guard(request)||handlePresence(request);}
