import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PeriodoService } from 'src/app/_service/periodo.service';

@Component({
  selector: 'app-view-periodos',
  templateUrl: './view-periodos.component.html',
  styleUrls: ['./view-periodos.component.css']
})
export class ViewPeriodosComponent implements OnInit {

  displayedColumns: string[] = ['Codigo', 'Descripcion', 'Cabecera','Acciones'];
      dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
      cargando: boolean= false;
    
      @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
      @ViewChild(MatSort) sort!: MatSort;

  constructor(
     private periodoServices: PeriodoService
   
  ) { }

  ngOnInit(): void {
  this.cargarPeriodo();
    }
  
    cargarPeriodo(){
      this.periodoServices.listar().subscribe(
        {
          next:(response:any)=>{
            debugger;
            this.createTable(response);
          },
          error:(er:any)=>{
      
          }
        }
      );
    }
  
    createTable(documentos: any[]): void {
      this.dataSource = new MatTableDataSource(documentos);
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
  
        
      });
  
    }
  
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
  
    }
  
  }