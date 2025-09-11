import { DocumentoService } from 'src/app/_service/documento.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { DecretoDTO } from 'src/app/_DTO/DecretoDTO';
import { environment } from 'src/environments/environment';
import { DecretoService } from 'src/app/_service/decreto.service';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { OrganizacionDiagram } from 'src/app/_DTO/OrganizacionDiagram';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registrar-devolver',
  templateUrl: './registrar-devolver.component.html',
  styleUrls: ['./registrar-devolver.component.css']
})
export class RegistrarDevolverComponent implements OnInit {

  form:FormGroup;
  url_pdf: any;
  vidDocumento:any;
  codigoDecreto: any;
  observaciones : any = '';
  errorPDF : boolean = false;
  cargando : boolean = false;
  destinos: OrganizacionDiagram[] = [];
  viewObservacion: boolean = false;

  motivos: any[] = [
    {
      idMotivo: 1, descripcion: 'MAL REDACTADO'
    },
    {
      idMotivo: 2, descripcion: 'FALTA ANEXOS'
    },
    {
      idMotivo: 3, descripcion: 'MALA DISTRIBUCION'
    },
    {
      idMotivo: 4, descripcion: 'OTROS'
    },
  ]

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
  }

  getIdDocumento(): void {
    const id = +this.route.snapshot.paramMap.get('codigoDocumento');
    this.codigoDecreto = this.route.snapshot.paramMap.get('idDecreto');
    this.vidDocumento = id;
    this.viewDocumento(id);
    this.findByDevolver();
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

  initForm(){
    this.cargando = true;
    this.form = new FormGroup({
      'idDocumento': new FormControl(this.vidDocumento, [Validators.required]),
      'idDecreto': new FormControl(this.codigoDecreto, [Validators.required]),
       'destino': new FormControl('', [Validators.required]),
      //'motivo': new FormControl('', [Validators.required]),
      'descripcion': new FormControl('', [Validators.minLength(10)])
    })
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

  insertObservaciones(){
    let motivo = this.form.get('motivo').value;
    if (motivo.idMotivo=='4')
      this.viewObservacion = true;
    else this.viewObservacion = false;
  }

  devolverDocumento(){
    // let motivo = this.form.controls['motivo'].value;
    let observacion = this.form.controls['descripcion'].value;
    if (this.form.valid ){
      this.cargando = true;
      let documento : any = this.vidDocumento; //this.form.controls['idDocumento'].value;
      let origen = sessionStorage.getItem(environment.codigoOrganizacion);
      let destino = this.form.controls['destino'].value;

      this.decretoService.devolverDocumento(
        documento, origen,
        // observacion!=''? motivo.descripcion + ' :' + observacion : observacion,
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

  findByDevolver(){
    this.organizacionService.findByDevolver(this.codigoDecreto).subscribe({
      next: (response:any)=> {
        this.destinos = response.data;
      }, error: (err:any)=> {
        Swal.fire("AVISO", err.message, "warning");
      }
    })
  }


}
