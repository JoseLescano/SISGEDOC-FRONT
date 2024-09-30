import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { DecretoService } from 'src/app/_service/decreto.service';
import { DocumentoService } from 'src/app/_service/documento.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update-devolver',
  templateUrl: './update-devolver.component.html',
  styleUrls: ['./update-devolver.component.css']
})
export class UpdateDevolverComponent implements OnInit {

  form:FormGroup;
  url_pdf: any;
  vidDocumento:any;
  codigoDecreto: any;
  observaciones : any = '';
  errorPDF : boolean = false;
  cargando : boolean = false;
  destinos: OrganizacionDiagram[] = [];

  constructor(
    private documentoService:DocumentoService,
    private decretoService: DecretoService,
    private organizacionService: OrganizacionService,
    private route: ActivatedRoute,
    private router: Router,
    private elRef: ElementRef,
  ) { }

  ngOnInit(): void {
    this.getIdDocumento();
    this.initForm();
    this.findByDevolver();
  }

  initForm(){
    this.cargando = true;
    this.form = new FormGroup({
      'idDocumento': new FormControl(this.vidDocumento, [Validators.required]),
      'idDecreto': new FormControl(this.codigoDecreto, [Validators.required]),
       'destino': new FormControl('', [Validators.required]),
      'descripcion': new FormControl('', [Validators.minLength(10)])
    })
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.codigoDecreto = this.route.snapshot.paramMap.get('idDecreto');
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

  findByDevolver(){
    this.organizacionService.destinatariosExternoByDecreto(sessionStorage.getItem(environment.codigoOrganizacion), this.codigoDecreto).subscribe({
      next: (response:any)=> {
        debugger;
        this.destinos = response.data;
      }
    })
  }

  actualizarDocumento(){
    debugger;
    if (this.form.valid ){
      this.cargando = true;
      let observacion = this.form.controls['descripcion'].value;
      let destino = this.form.controls['destino'].value;

      this.decretoService.actualizarDocumento(
        observacion,
         this.codigoDecreto, destino
        ).subscribe((response:any)=>{
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
