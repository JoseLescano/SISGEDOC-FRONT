import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { FormComponent } from './form/form.component';

@Component({
  selector: 'app-parte-diario',
  templateUrl: './parte-diario.component.html',
  styleUrls: ['./parte-diario.component.css']
})
export class ParteDiarioComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['Nro', 'Asunto', 'Origen','Destino', 'FechaDoc', 'Documento',  'Acciones'];
  dataSource: MatTableDataSource<Documento>;
  cargando: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private documentoService: DocumentoService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) { }

  ngOnInit(): void {
    this.documentoService.findParaParte(sessionStorage.getItem(environment.codigoOrganizacion)).subscribe((response:any)=>{
      this.dataSource = response;
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

  verDocumento(documentoSeleccionado?:any): void {
    const dialogRef = this.dialog.open(ViewDocumentoComponent, {
      width: '60%',
      height: '95%',
      data: documentoSeleccionado
    });
  }

  openDialog(documentoSeleccionado?: Documento){
    this.dialog.open(FormComponent, {
      width: '80%',
      height: '90%',
      data : documentoSeleccionado
    });
  }

}
