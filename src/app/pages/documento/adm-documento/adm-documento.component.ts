import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { MatDialog } from '@angular/material/dialog';
import { ExcelService } from 'src/app/_service/excel.service';
import { FormControl, FormGroup } from '@angular/forms';
import { PersonaService } from 'src/app/_service/persona.service';
import { Persona } from 'src/app/_model/persona';
import { HttpErrorResponse } from '@angular/common/http';
import { Organizacion } from 'src/app/_model/organizacion';
import { OrganizacionService } from 'src/app/_service/organizacion.service';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { SeguimientoComponent } from '../../report/seguimiento/seguimiento.component';

@Component({
  selector: 'app-adm-documento',
  templateUrl: './adm-documento.component.html',
  styleUrls: ['./adm-documento.component.css']
})
export class AdmDocumentoComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Nro',  'Asunto', 'Documento', 'Origen', 'Destino', 'FechaDoc.'];
  displayedBusqueda: string[] = ['Nro',  'Asunto', 'Documento', 'Origen', 'Destino', 'FechaDoc.', 'Acciones'];

  dataSource: MatTableDataSource<Documento> = new MatTableDataSource<Documento>();
  dataSourceBusqueda: MatTableDataSource<any> = new MatTableDataSource<any>();
  campoIngresado: any;

  busquedaDocumentoByAdm: any;

  tipoBusqueda: any = [
    {id: 1, text: 'NUCLEO'},
    {id: 2, text: 'ESCALON INMEDIATO'},
    {id: 3, text: 'DOC. EN BANDEJA'},
  ];
  cargandoNucleo : boolean;
  documentoBandejaBySuperAdm: boolean;

  barChart: Chart;
  barChartHorizontal: Chart;
  type : any = 'bar';

  persona: Persona = new Persona();
  nombreCompleado: string;
  CIPIngresado: any;
  observacionArchivado: any = '';

  @ViewChild(MatPaginator, { static: false }) paginatorBusqueda!: MatPaginator;
  @ViewChild(MatSort) sortBusqueda!: MatSort;

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  cargando: boolean = true;
  cargandoArchivado: boolean = false;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  mostrarDetalleGrafica: boolean = false;
  nucleos: Organizacion[] = [];
  nucleoSeleccionado: Organizacion = null;
  brigadas: Organizacion[] = [];
  brigadaSeleccionada: Organizacion = null;
  unidades: Organizacion[] = [];
  unidadSeleccionada: Organizacion = null;

  countPendientes:number=0;
  countFirmar:number=0;
  countArchivados:number=0;
  countRemitidos: number= 0;

  constructor(private documentoService: DocumentoService,
    public dialog: MatDialog,
    private excelService: ExcelService,
    private personaService: PersonaService,
    private organizacionService: OrganizacionService
  ) { }


  ngOnInit(): void {
    //this.verNucleo();
  }

  buscarPersona(campo:any){

    this.personaService.findByCampo(this.CIPIngresado).subscribe(
      {
        next: (data:any)=> {
          if (data!= null){
            this.cargando = true;
            this.persona = data;
            this.nombreCompleado = this.persona.grado_LARGA + ' '+ this.persona.arma_LARGA + ' '+  this.persona.apellidos+  ' ' + this.persona.nombres;
            this.cargando=false;
          }else {
            this.persona = null;
            this.nombreCompleado = '';
            this.cargando=false;
            Swal.fire('SIN RESULTADOS', `NO SE ENCONTRO DATOS CON EL CIP INGRESADOx`, 'info');
          }
        },
        error: (error: any| HttpErrorResponse)=> {
          this.nombreCompleado = '';
          this.persona.correo_CHASQUI = '';
          this.dataSource = null;
          this.cargando=false;
          Swal.fire('LO SENTIMOS', `NO SE ENCONTRO DATOS CON EL CIP INGRESADO`, 'info');
        }

      })
  }

  downloadExcel(): void {
    this.excelService.downloadPendientes(
      this.campoIngresado)
      .subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documentos_pendientes.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  cargarDocumentos(){
    this.cargando = true;
    this.documentoService.findByOrganizacionDestinoForSuperAdm(
      this.campoIngresado,
      environment.convertDateToStr(this.range.value['start']),
      environment.convertDateToStr(this.range.value['end'])
    )
      .subscribe(
        {
          next : (data: Documento[]) => {
            this.createTable(data);
            this.cargando = false;

          }, error: err => {
            this.cargando = false;
            Swal.fire('Lo sentimos', err, 'warning');
          }
        });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSourceBusqueda.paginator = this.paginatorBusqueda;
      this.dataSourceBusqueda.sort = this.sortBusqueda;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  createTable(documento: Documento[]) {
    this.dataSource.data = documento;
    setTimeout(() => {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }


  createTableBusqueda(documento: any[]) {
    this.dataSourceBusqueda.data = documento;
    setTimeout(() => {
      this.dataSourceBusqueda.paginator = this.paginatorBusqueda;
      this.dataSourceBusqueda.sort = this.sortBusqueda;
    });
  }

  guardarAchivoForSuperADM(){
    this.cargandoArchivado = true;
    let usuario = this.persona.usuario_CHASQUI;
    let fi =  environment.convertDateToStr(this.range.value['start']);
    let ff = environment.convertDateToStr(this.range.value['end']);
    this.documentoService.archivarDocumentoForSuperAdm(
      this.campoIngresado, this.observacionArchivado, fi,ff, usuario).subscribe(
      {
        next : (response:any) => {
          this.cargandoArchivado = false;
          Swal.fire('ACCION REALIZADA', response.message, 'info');
        }, error: (err: any)=> {
          this.cargandoArchivado = false;
        }
      }
    );
  }

  validarNumero(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    if (!/^\d+$/.test(inputChar)) {
      event.preventDefault();
    }
  }


  verNucleo() {
    this.cargandoNucleo = true;
    this.organizacionService.getUnidadNucleo().subscribe((response:any)=> {
      this.nucleos = response.data;
    }, error => {
      Swal.fire('LO SENTIMOS', 'Error en la carga de nucleos', 'info');
    });
    //tDocumentoBandejaBySuperAdm
    this.documentoService.getDocumentoBandejaNucleo().subscribe({
      next: (response: any) => {
        this.cargandoNucleo = false;
        let etiquetas = response.map(x => x.etiqueta);
        let valores = response.map(x => x.valor);
        let ids = response.map(x => x.codigo);
        this.barChart = new Chart('canvas', {
          type: 'bar',
          data: {
            labels: etiquetas,
            datasets: [{
              label: 'DOCUMENTOS EN BANDEJA DE NUCLEOS',
              data: valores,
              backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
              ],
              borderColor: [
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)',
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
              ],
              borderWidth: 1
            }],
          },
          options: {
            aspectRatio: 2.5,
            responsive: true,
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const index = elements[0].index;
                let idSeleccionado = ids[index];
                this.documentoService.countStadisticForSuperADM(idSeleccionado).subscribe(
                  {
                    next : (response:any)=> {
                      debugger;
                      this.countPendientes = response.PENDIENTES;
                      this.countArchivados = response.ARCHIVADOS;
                      this.countFirmar = response.PARA_FIRMA;
                      this.countRemitidos = response.REMITIDOS;
                    }
                  }
                );
              }
            },
            plugins: {
              datalabels: {
                anchor: 'end',
                align: 'end',
                formatter: function(value) {
                  return 'Total: ' + value;
                },
                font: {
                  weight: 'bold'
                },
                offset: -5,

              }
            }
          },
          plugins: [ChartDataLabels]
        });
      },
      error: (err: any) => {
        this.cargandoNucleo = false;
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      }
    });
    this.cargandoNucleo = false;
    if (this.barChartHorizontal) {
      this.barChartHorizontal.destroy();
    }
  }

  mostrarGraficaDetalle(id: string, uu:string) {
    this.documentoBandejaBySuperAdm = true;
    //
    this.documentoService.getDocumentoBandejaBySuperAdm(id).subscribe({
      next: (response: any) => {
        this.documentoBandejaBySuperAdm = false;
        // Si ya existe un gráfico previo, destrúyelo.
        if (this.barChartHorizontal) {
          this.barChartHorizontal.destroy();
        }

        let etiquetas = response.map(x => x.etiqueta);
        let valores = response.map(x => x.valor);
        let ids = response.map(x => x.codigo);
        this.barChartHorizontal = new Chart('canvasHorizontal', {

          type: 'bar',
          data: {
            labels: etiquetas,
            datasets: [{
              indexAxis: 'y',
              label: `DOCUMENTOS EN BANDEJA DE LAS UU - ${uu}`,
              data: valores,
              backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(201, 203, 207, 0.2)',
                'rgba(255, 99, 132, 0.2)',
                'rgba(255, 159, 64, 0.2)',
                'rgba(255, 205, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
              ],
              borderColor: [
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)',
                'rgb(201, 203, 207)',
                'rgb(255, 99, 132)',
                'rgb(255, 159, 64)',
                'rgb(255, 205, 86)',
                'rgb(75, 192, 192)',
              ],
              borderWidth: 1
            }],
          },
          options: {
            aspectRatio: 2.5,
            responsive: true,
          }
        });
      },
      error: (err: any) => {
        this.documentoBandejaBySuperAdm = false;
        Swal.fire('LO SENTIMOS', 'SE PRESENTO UN INCONVENIENTE', 'info');
      }
    });
    this.documentoBandejaBySuperAdm = false;
  }

  getChildren(){
    this.mostrarDetalleGrafica = false;
    this.brigadas = [];
    this.brigadaSeleccionada = null;
    this.unidades = [];
    this.unidadSeleccionada = null;
    this.organizacionService.getChildrenByCodigo(this.nucleoSeleccionado.codigoInterno).subscribe((response:any)=> {
      this.brigadas = response.data;
    });
    this.mostrarDetalle();
  }

  getUnidad(){
    this.unidades = [];
    this.unidadSeleccionada = null;
    this.organizacionService.getChildrenByCodigo(this.brigadaSeleccionada.codigoInterno).subscribe((response:any)=> {
      this.unidades = response.data;
    });
    this.mostrarDetalle();
  }

  mostrarDetalle(){
    this.mostrarDetalleGrafica = true;
    if (this.unidadSeleccionada!= null){
      this.mostrarGraficaDetalle(this.unidadSeleccionada.codigoInterno, this.unidadSeleccionada.acronimo);
    } else  if(this.brigadaSeleccionada!= null){
      this.mostrarGraficaDetalle(this.brigadaSeleccionada.codigoInterno, this.brigadaSeleccionada.acronimo);
    }else {
      this.mostrarGraficaDetalle(this.nucleoSeleccionado.codigoInterno, this.nucleoSeleccionado.acronimo);
    }
  }

  exportSuperAdm(){
    this.excelService.exportSuperAdm(this.nucleoSeleccionado.codigoInterno).subscribe((response:any)=> {
      this.descargarExporExcel(response, "REPORTE" );
    })
  }

  descargarExporExcel(blob:any, nombreDescarga:any){
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nombreDescarga}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  busquedaDocumentoBySuperADM(){
    this.documentoService.findBySuperAdm(this.busquedaDocumentoByAdm).subscribe({
      next: (response: any)=> {
        this.createTableBusqueda(response);
      }
    });
  }

  openDialog(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

  viewSeguimiento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(SeguimientoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }

}
