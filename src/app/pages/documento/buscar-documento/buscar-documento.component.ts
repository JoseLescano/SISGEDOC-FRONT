import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-buscar-documento',
  templateUrl: './buscar-documento.component.html',
  styleUrls: ['./buscar-documento.component.css']
})
export class BuscarDocumentoComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Estado', 'Nro', 'Origen', 'FechaDoc', 'Documento', 'Asunto', 'Acciones'];
  dataSource: MatTableDataSource<Documento>;
  cargando: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private documentoService: DocumentoService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.generarReporte(+params.get('tipoReporte'));
    });
  }

  generarReporte(tipoReporte: number): void {
    this.cargando = true;
    if (tipoReporte === 2) {
      this.documentoService.findDecretados(environment.codigoOrganizacion, '01/04/2024', '31/12/2024').subscribe((data: any) => {
        this.createTable(data);
        this.cargando = false;
      }, (error: any)=> {
         this.cargando = false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
    } else if (tipoReporte === 3) {
      this.documentoService.findArchivadosByOrganizacion(environment.codigoOrganizacion).subscribe((data: any) => {
        this.createTable(data);
        this.cargando = false;
      }, (error: any)=> {
         this.cargando = false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
    } else if (tipoReporte === 6) {
      this.documentoService.findDerivadosByOrganizacion(environment.codigoOrganizacion).subscribe((data: any) => {
        this.createTable(data);
        this.cargando = false;
      }, (error: any)=> {
         this.cargando = false;
        Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
      });
    }

    // Actualizar la ruta en el navegador
    this.router.navigate(['/buscar-documento', tipoReporte]);
  }

  createTable(documentos: Documento[]): void {
    this.dataSource = new MatTableDataSource(documentos);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngAfterViewInit() {
    this.dataSource = null;
    if (this.dataSource!= null){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

}
