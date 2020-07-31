import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root'})
export class EventSourceService {

  _eventSourceInstance: EventSource;

  constructor(private _zone: NgZone) {}

    getServerSentEvent(url: string): Observable<any> {

      return Observable.create(observer => {

        const eventSource = this.getEventSource(url);

        eventSource.addEventListener("Add", //utilizar enum aqui
          (event: MessageEvent) => 
            this._zone.run(() => { 
              observer.next(event) 
            })
        );

        eventSource.addEventListener("Like", 
        (event: MessageEvent) => 
          this._zone.run(() => { 
            observer.next(event) 
          })
      );

        eventSource.onmessage = (event: MessageEvent) => {
          this._zone.run(() => {
            //console.log(event);
            observer.next(event);
          });
        };

        eventSource.onerror = error => {
          this._zone.run(() => {
            console.log(error);
            observer.error(error);
          });
        };

      });
    }

    private getEventSource(url: string): EventSource {
        if(this._eventSourceInstance == null)
        {
          this._eventSourceInstance = new EventSource(url); //Single stream instance? - multiple stream? inroot, zone ? etc
        }
        else
        {
          console.log('Trying to create other stream instance for url: '+this._eventSourceInstance.url);
          //if instance.url != url then create new instance
        }
        return this._eventSourceInstance;
    }


}
