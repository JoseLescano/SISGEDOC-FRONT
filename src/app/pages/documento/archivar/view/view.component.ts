import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ViewDocumentoComponent } from '../../view-documento/view-documento.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, AfterViewInit {

  // displayedColumns: string[] = ['Estado', 'Nro', 'Origen', 'FechaDoc', 'Documento', 'Asunto', 'Acciones'];
  displayedColumns: string[] = ['Nro', 'Asunto', 'Origen', 'FechaDoc', 'Documento',  'Acciones'];
  dataSource: MatTableDataSource<Documento>;
  cargando: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private documentoService: DocumentoService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.generarReporte();
    });
  }

  generarReporte(): void {
    this.cargando = true;
    this.documentoService.findArchivadosByOrganizacion(environment.codigoOrganizacion).subscribe((data: any) => {
      this.createTable(data);
      this.cargando = false;
    }, (error: any)=> {
       this.cargando = false;
      Swal.fire('Lo sentimos', `Se presento un inconveniente en la consulta`, 'warning');
    });
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

  openDialog(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado,
    });
  }


}
