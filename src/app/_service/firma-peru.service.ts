import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { from, map, Observable, Subject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';


declare var jQuery: any;
declare var $: any;
declare var startSignature: any;
declare var jqFirmaPeru: any;

@Injectable({
  providedIn: 'root'
})
export class FirmaPeruService {

  private firmaCallback = new Subject<void>();
  private cancelCallback = new Subject<void>();
  private scriptLoaded = false;

  constructor() {
    this.initializeFirmaScript();
  }

  private initializeFirmaScript() {
    // Primero cargamos jQuery si no está presente
    const jqueryScript = document.createElement('script');
    jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    jqueryScript.async = true;
    jqueryScript.onload = () => {
      // Una vez que jQuery está cargado, cargamos el script de FirmaPeru
      const firmaPeruScript = document.createElement('script');
      firmaPeruScript.src = 'https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js';
      firmaPeruScript.async = true;
      firmaPeruScript.onload = () => {
        this.setupFirmaListeners();
        this.scriptLoaded = true;
      };
      document.body.appendChild(firmaPeruScript);
    };
    document.body.appendChild(jqueryScript);
  }

  private setupFirmaListeners() {
    try {
      // Establecer la variable jqFirmaPeru requerida
      (window as any).jqFirmaPeru = jQuery.noConflict(true);

      // Asignar jQuery y $ para FirmaPeru
      (window as any).jQuery = (window as any).jqFirmaPeru;
      (window as any).$ = (window as any).jqFirmaPeru;

      // Prevenir el cierre con ESC
      document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
        }
      });

      // Definir funciones globales necesarias
      (window as any).signatureInit = () => {
        console.log('Iniciando firma...');
      };

      (window as any).signatureOk = () => {
        this.firmaCallback.next();
        console.log('Documento Firmado');
      };

      (window as any).signatureCancel = () => {
        this.cancelCallback.next();
        console.log('Operación Cancelada');
      };
    } catch (error) {
      console.error('Error al configurar FirmaPeru:', error);
    }
  }

  public iniciarFirma(configuracion: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.scriptLoaded) {
        reject('Los scripts de FirmaPeru no se han cargado completamente');
        return;
      }

      const subscription = this.firmaCallback.subscribe(() => {
        resolve();
        subscription.unsubscribe();
      });

      const cancelSubscription = this.cancelCallback.subscribe(() => {
        reject('Firma cancelada');
        cancelSubscription.unsubscribe();
      });

      try {
        // const token = sessionStorage.getItem('access_token');
        const token = sessionStorage.getItem('access_token')==null ? environment.TOKEN_NAME: sessionStorage.getItem('access_token');
        const param = {
          "param_url": `${environment.HOST}documentos/firmaPeru/${configuracion}?access_token=${token}`,
          "param_token": "162647697663667",
          "document_extension": "pdf"
        };

        const json = JSON.stringify(param);
        const base64 = btoa(json);
        startSignature("48596", base64);
      } catch (error) {
        reject('Error al iniciar el proceso de firma: ' + error);
      }
    });
  }

  public waitForScriptLoad(): Promise<void> {
    return new Promise((resolve) => {
      if (this.scriptLoaded) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (this.scriptLoaded) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    });
  }

}
