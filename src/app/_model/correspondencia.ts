import { Clase } from "./clase";
import { Organizacion } from "./organizacion";
import { Persona } from "./persona";

export class Correspondencia {
    codigo: number;
    fechaRegistro: string;
    origen: Organizacion;
    destino: Organizacion;
    nroSobre: string;
    asunto: string;
    dniRegistra: string;
    dniEntrega: string;
    fechaEntrega: string;
    estado: string;
    fechaCreacion: string;
    usuarioRegistra: string;
    usuarioEntrega: string;
    observaciones: string;
    clase: Clase;
    folio: string;
    motivoEdicion: string;
    motivoElimina: string;
    dniRecibe: string;
    organizacionRegistra: string;
}