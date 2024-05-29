import { Decreto } from "../_model/decreto";
import { DecretoAccionDTO } from "./DecretoAccionDTO";
import { DecretoDTO } from "./DecretoDTO";

export class DecretoDocumentoDTO{

    codigoDocumento:number;
    decretoActual: any;
    decretos: DecretoDTO[];

}
