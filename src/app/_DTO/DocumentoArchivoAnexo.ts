import { Documento } from "../_model/documento.model";

export class DocumentoArchivoAnexo{
    documento:Documento;
    destino:String[];
    archivoPrincipal:File;
    anexos:File[];
}