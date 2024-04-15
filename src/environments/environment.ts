// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  HOST: 'http://localhost:8080/',
  
  cantidadPaginasPDF:function(inFile:any,incallback:any){
    var reader:any = new FileReader();
    reader.readAsBinaryString(inFile);
    reader.onloadend = function(){
    var count = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length;
      incallback(count);
    }

  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
