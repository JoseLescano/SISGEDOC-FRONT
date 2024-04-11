import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Documento } from 'src/app/_model/documento.model';
import { DocumentoService } from 'src/app/_service/documento.service';

@Component({
  selector: 'app-buscar-documento',
  templateUrl: './buscar-documento.component.html',
  styleUrls: ['./buscar-documento.component.css']
})
export class BuscarDocumentoComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['#', 'Estado', 'Nro', 'Origen', 'FechaDoc', 'Documento', 'Asunto', 'Acciones'];
  dataSource: MatTableDataSource<Documento>;
  cargando:boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private documentoService:DocumentoService) { }

  ngOnInit(): void {
    this.cargando=true;
    this.documentoService.findDecretados('03', '01/04/2024', '31/12/2024').subscribe((data:any)=> {
      this.createTable(data);
      this.cargando = false;
    });
    
  }

  createTable(documentos: Documento[]){
    
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
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
