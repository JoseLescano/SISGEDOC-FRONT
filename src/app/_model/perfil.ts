import { Organizacion } from "./organizacion";
import { Persona } from "./persona";
import { Rol } from "./rol";

export class Perfil{

  codigo:number;
  nombre:string;
  rol:Rol;
  usuario:Persona;
  organizacion:Organizacion;

}
