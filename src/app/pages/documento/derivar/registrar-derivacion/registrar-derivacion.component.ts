import  Swal  from 'sweetalert2';
import { DecretoService } from 'src/app/_service/decreto.service';
import { DocumentoService } from 'src/app/_service/documento.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ElementRef } from '@angular/core';
import { Organizacion } from 'src/app/_model/organizacion';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Decreto } from 'src/app/_model/decreto';
import { DecretoDTO } from 'src/app/_DTO/DecretoDTO';

@Component({
  selector: 'app-registrar-derivacion',
  templateUrl: './registrar-derivacion.component.html',
  styleUrls: ['./registrar-derivacion.component.css']
})
export class RegistrarDerivacionComponent implements OnInit {

  url_pdf: any;
  vidDocumento:any;
  observaciones : any = '';
  errorPDF : boolean = false;
  destinos:Organizacion[] = [];
  cargando: boolean = false;
  form:FormGroup;

  constructor(
    private documentoService:DocumentoService,
    private decretoService: DecretoService,
    private organizacionService: OrganizacionService,
    private route: ActivatedRoute,
    private router: Router,
    private elRef: ElementRef,
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(){
    this.cargando = true;
    this.getIdDocumento();
    this.getOrganizacion();
    this.form = new FormGroup({
      'codigoDocumento': new FormControl(this.vidDocumento, [Validators.required]),
      'destino': new FormControl('', [Validators.required]),
      'observacion': new FormControl(null, [Validators.required, Validators.min(10)])
    });
    this.cargando = false;
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.vidDocumento = id;
    this.viewDocumento(id);
  }

  viewDocumento(vidDocumento: any){
    this.documentoService.viewPDF(vidDocumento).subscribe((response: any)=>{
      this.crearDocumento(response.data);
      this.errorPDF = false;
    }, error => {
      this.errorPDF = true;
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

  getOrganizacion(){
    this.organizacionService.findForDerivacion(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((response:any)=> {
      this.destinos = response.data;
    });
  }

  operate(){
    if (this.form.valid){
      this.cargando = true;
      let documento: any = this.vidDocumento;
      let origen = sessionStorage.getItem(environment.codigoOrganizacion);
      let destino = this.form.value['destino'];
      let observacion = this.form.value['observacion'];
      this.decretoService.derivarDocumento(documento, origen, destino, observacion).subscribe((response:any)=>{
        if(response.httpStatus == 'CREATED'){
          this.cargando = false;
          Swal.fire('OPERACION REALIZADA', response.message, 'info');
          this.router.navigate(['/principal/pendientes']);
        }else {
          this.cargando = false;
          Swal.fire('LO SENTIMOS', response.message, 'info');
        }
      }, error => {
        this.cargando = false;
        Swal.fire('Lo sentimos', 'Se presento un inconveniente', 'warning');
      });
    }



  }



}
