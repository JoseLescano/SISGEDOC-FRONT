import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DocumentoService } from 'src/app/_service/documento.service';
import { ViewDocumentoComponent } from '../view-documento/view-documento.component';
import { SeguimientoComponent } from '../../report/seguimiento/seguimiento.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-search-sa',
  templateUrl: './search-sa.component.html',
  styleUrls: ['./search-sa.component.css']
})
export class SearchSAComponent implements OnInit, AfterViewInit {

  displayedBusqueda: string[] = ['Nro',  'Asunto', 'Documento', 'Origen', 'Destino', 'FechaDoc.', 'Acciones'];
  dataSourceBusqueda = new MatTableDataSource([]);
  busquedaDocumentoByAdm: any;
  documentoBandejaBySuperAdm: boolean;
  @ViewChild('paginatorBusqueda') paginatorBusqueda!: MatPaginator;
  @ViewChild('sortBusqueda') sortBusqueda!: MatSort;

  constructor(
    private documentoService: DocumentoService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dataSourceBusqueda.paginator = this.paginatorBusqueda;
    this.dataSourceBusqueda.sort = this.sortBusqueda;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceBusqueda.filter = filterValue.trim().toLowerCase();
  }

  createTableBusqueda(documento: any[]) {
    this.dataSourceBusqueda.data = documento;
      this.dataSourceBusqueda.paginator = this.paginatorBusqueda;
      this.dataSourceBusqueda.sort = this.sortBusqueda;
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
