import { Clase } from "./clase";
import { Organizacion } from "./organizacion";
import { Periodo } from "./periodo";

export class DocumentoRespuesta {
    codigo:number;
    decreto:any;
    periodo:Periodo;
    codigoInternoDocumento:string;
    file:any;
    fechaRespuesta:string;
    url:string;
    correlativo:string;
    origen:Organizacion;
    destino:Organizacion;
    clase:Clase;
    numeroDocumentoRespuesta:string;
    indicativo:string;
    observaciones:string;
    asunto:string;
    estado:string;
    copiaInformativa:string;
    destinos:string;
    claveDocumentoRespuesta:string;
    
}