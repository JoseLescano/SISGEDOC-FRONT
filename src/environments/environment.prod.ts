import * as moment from "moment";

export const environment = {
  production: true,
  HOST: 'http://localhost:8081/back-sisgedo/',
  //HOST: 'https://sisgedo.ejercito.mil.pe/back-sisgedo/',
  codigoOrganizacion: '3302010102',
  TOKEN_AUTH_USERNAME: '', // almacena usuario del token
  TOKEN_NAME: 'access_token', // token completo
  RETRY: 2,
  cargoSeleccionado: '',
  nombreOrganizacion: '',
  recaptcha: {
    siteKey: '6LfQ7FcqAAAAABb385jo3379ntK79MCEzXKQz6og',
    siteKeyV3: '6LfQ7FcqAAAAABb385jo3379ntK79MCEzXKQz6og',
  },

  rol: '002',

  cantidadPaginasPDF: function (inFile: any, incallback: any) {
    var reader: any = new FileReader();
    reader.readAsBinaryString(inFile);
    reader.onloadend = function () {
      var count = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length;
      incallback(count);
    }
  },
  convertStringToDateBD: function (inStrDate: any, inFormat: any = "DD/MM/YYYY") {
    var date = new Date(inStrDate + " 00:00:00");
    var myDate = moment(date).format(inFormat);
    return myDate;
  },
  convertDateToStr: function (inDate: any, inFormat: any = "DD-MM-YYYY") {
    var date = new Date(inDate);
    var myDate = moment(date).format(inFormat);
    return myDate;
  },
};
