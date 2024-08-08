import { DocumentoService } from 'src/app/_service/documento.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { DecretoDTO } from 'src/app/_DTO/DecretoDTO';
import { environment } from 'src/environments/environment';
import { DecretoService } from 'src/app/_service/decreto.service';

@Component({
  selector: 'app-registrar-devolver',
  templateUrl: './registrar-devolver.component.html',
  styleUrls: ['./registrar-devolver.component.css']
})
export class RegistrarDevolverComponent implements OnInit {

  url_pdf: any;
  vidDocumento:any;
  observaciones : any = '';
  errorPDF : boolean = false;
  cargando : boolean = false;

  constructor(
    private documentoService:DocumentoService,
    private decretoService: DecretoService,
    private route: ActivatedRoute,
    private router: Router,
    private elRef: ElementRef,
  ) { }

  ngOnInit(): void {
    this.getIdDocumento();
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.vidDocumento = id;
    this.viewDocumento(id);
  }

  viewDocumento(vidDocumento: any){
    this.cargando = true;
    this.documentoService.viewPDF(vidDocumento).subscribe((response: any)=>{
      this.crearDocumento(response.data);
      this.cargando = false;
      this.errorPDF = false;
    }, error => {
      this.errorPDF = true;
      this.cargando = false;
      Swal.fire('LO SENTIMOS', `SE PRESENTO UN INCONVENIENTE EN CARGAR PDF!`, 'warning');
    });
  }

  crearDocumento(resp: any){
    let byteArray = new Uint8Array(
      atob(resp[0])
        .split('')
        .map((char) => char.charCodeAt(0))
    );
    let file = new Blob([byteArray], { type: 'application/pdf' });
    let fileURL = URL.createObjectURL(file);
    this.url_pdf = fileURL;
    let iframe:any = this.elRef.nativeElement.querySelector('iframe')as HTMLIFrameElement;
    iframe.contentWindow.location.replace(fileURL);

  }

  devolverDocumento(codigoDocumento:any){

    if (this.observaciones!='' && this.observaciones!=null){
      this.cargando = true;
      let documento : any = codigoDocumento;
      let observacion = this.observaciones;
      let origen = sessionStorage.getItem(environment.codigoOrganizacion);

      this.decretoService.devolverDocumento(documento, origen, observacion).subscribe((response:any)=>{
        if(response.httpStatus == 'CREATED'){
          this.cargando = false;
          this.router.navigate(['/principal/dashboard']);
          Swal.fire('ACCION REALIZADA',response.message, 'info')
        }else {
          this.cargando = false;
          Swal.fire('LO SENTIMOS', response.message, 'info');
        }
      }, (error:any)=> {
        this.cargando = false;
        Swal.fire('Lo sentimos!', `No podemos devolver documento`, 'info');
      });
    }else {
      this.cargando = false;
      Swal.fire('Lo sentimos!', `Debe de ingresar una observación para continuar con el registro`, 'info');
    }
  }


}
