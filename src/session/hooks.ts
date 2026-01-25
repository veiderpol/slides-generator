import {useContext} from "react";
import { ActiveSessionContext } from "./ActiveSessionProvider";
export function useActiveSession(){
    const v = useContext(ActiveSessionContext);
    if(!v) throw new Error("useActiveSession must be used within ActiveSessionProvider");
    return v;
}