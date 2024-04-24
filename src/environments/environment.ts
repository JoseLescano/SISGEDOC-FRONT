import * as moment from "moment";

export const environment = {
  production: false,
  HOST: 'http://localhost:8080/',
  codigoOrganizacion: '330201',

  cantidadPaginasPDF:function(inFile:any,incallback:any){
    var reader:any = new FileReader();
    reader.readAsBinaryString(inFile);
    reader.onloadend = function(){
    var count = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length;
      incallback(count);
    }
  },
  convertStringToDateBD:function(inStrDate:any,inFormat:any="DD/MM/YYYY"){
    var date=new Date(inStrDate+" 00:00:00");
    var myDate = moment(date).format(inFormat);
    return myDate;
  },
  convertDateToStr:function(inDate:any,inFormat:any="dd-MM-YYYY"){
    var date=new Date(inDate);
    var myDate = moment(date).format(inFormat);
    return myDate;
  },
};
