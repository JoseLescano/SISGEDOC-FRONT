import { Documento } from "../_model/documento.model";
import { EstadoDocumento } from "../_model/estadoDocumento";
import { Organizacion } from "../_model/organizacion";
import { Periodo } from "../_model/periodo";
import { Prioridad } from "../_model/prioridad";
import { DecretoAccionDTO } from "./DecretoAccionDTO";

export class DecretoDTO {
    codigo:number;
    codigoInterno: string;
    origen:Organizacion;
    prioridad: Prioridad;
    fechaDecreto: string;
    observacion:string;
    usuario: string;
    situacion:string;
    periodo:Periodo;
    codigoDocumentoInterno: string;
    destino:Organizacion;
    estado:EstadoDocumento;
    documento: Documento;
    acciones:DecretoAccionDTO[];
    vidReferencia: number;
    fechaLimite:string;
}