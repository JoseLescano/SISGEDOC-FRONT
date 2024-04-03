import { Clase } from "./clase";
import { Clasificacion } from "./clasificacion";
import { EstadoDocumento } from "./estadoDocumento";
import { Organizacion } from "./organizacion";
import { Periodo } from "./periodo";
import { Prioridad } from "./prioridad";

export class Documento {
  codigo:number;
  codigoInterno:string;
  periodo:Periodo;
  clase:Clase;
  nroOrden:string;
  clasificacion:Clasificacion;
  prioridad:Prioridad;
  fechaDocumento:string;
  asunto:string;
  estadoDocumento:EstadoDocumento;
  usuario:string;
  fechaActual:string;
  organizacionDestino:Organizacion;
  organizacionOrigen:Organizacion;
  claveIndicativo:string;
  tipoOrganizacion:string;
  url:string;
  indicativo:string;
  folio:number;
  copiaInformativa:string;
  destino:string;
  vidDocumentoPadre:string;

}
