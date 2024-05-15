import { Documento } from "./documento.model";
import { EstadoDocumento } from "./estadoDocumento";
import { Organizacion } from "./organizacion";
import { Periodo } from "./periodo";
import { Prioridad } from "./prioridad";

export class Decreto {
    codigo: number;
    codigoInterno: string;
    origen: Organizacion;
    prioridad: Prioridad;
    fechaDecreto: string;
    observacion: string;
    usuario: string;
    situacion: string;
    periodo: Periodo;
    codigoDocumentoInterno: string;
    destino: Organizacion;
    estado: EstadoDocumento;
    documento: Documento;
    vidReferencia: string;
    reqRespuesta: string;
    estadoRespuesta: string;
    vidCoordinador: string;
    fechaLimite: string;
    visado: string;
    vidPreDecreto: string;
    copiaInformativa: string;
    destinos: string;
    provieneExterna: string;

    acciones:any;
}