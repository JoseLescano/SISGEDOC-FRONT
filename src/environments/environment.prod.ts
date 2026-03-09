import * as moment from "moment";

export const environment = {
  production: true,
  HOST: 'https://m01uqeikta.execute-api.us-east-1.amazonaws.com/',
  codigoOrganizacion: '3302010102',
  TOKEN_AUTH_USERNAME: '', // almacena usuario del token
  TOKEN_NAME: 'access_token', // token completo
  RETRY: 2,
  cargoSeleccionado: '',
  nombreOrganizacion: '',
  recaptcha: {
    siteKey: '6LdEIYUsAAAAAM60iIDs8EnR57BVJ8tID_3HNCQA',
    siteKeyV3: '6LdEIYUsAAAAAM60iIDs8EnR57BVJ8tID_3HNCQA',
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
