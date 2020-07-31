import { Component, OnDestroy, OnInit,ViewChild } from '@angular/core';
import { EventSourceService } from '../event-source.service';
import { DeviceEvent } from '../models/DeviceEvent';
import { trigger, state, style, transition, animate, group } from '@angular/animations';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

//"add", "remove", "update", "message", "like", "dislike", "love"
export enum DeviceEventsTypeEnum {
  ADD = "Add",
  DEL = "Remove",
  UPDATE = "Update",
  MSG = "Message",
  LIKE = "Like",
  DISLIKE = "Dislike",
  LOVE = "love",
}

@Component({
  selector: 'app-device-events',
  templateUrl: './device-events.component.html',
  styleUrls: ['./device-events.component.css'],
  animations: [
    trigger('toggleBox', [
      // ...
      state('open', style({
        
      })),
      state('closed', style({
        
      })),
      transition('open => closed', [
        animate('.3s')
      ]),
      transition('closed => open', [
        animate('0.3s')
      ]),
    ]),
    trigger('simpleFadeOutAnimation', [

      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({opacity: 0})),

      // fade in when created. this could also be written as transition('void => *')
      transition(':enter', [
        style({opacity: 0.5}),
        animate(1000)
      ]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave',
        animate(1000, style({opacity: 0.5 })))
    ]),
    trigger('simpleFadeAnimation', [

      // the "in" style determines the "resting" state of the element when it is visible.
      state('in', style({opacity: 1})),

      // fade in when created. this could also be written as transition('void => *')
      transition(':enter', [
        style({opacity: 0}),
        animate(600 )
      ]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave',
        animate(600, style({opacity: 0})))
    ])
    
  ]
})


export class DeviceEventsComponent implements OnInit, OnDestroy
{
  messageEvents : Observable<MessageEvent>;
  events = [];
  eventsSubscription;
  
  deviceEvents: DeviceEvent[] = [];

  isalive = true;
  isOpen;
  

  addSubscription;
  removeSubscription;
  dislikeSubscription;
  likeSubscription;
  messageSubscription; //default
  
  DeviceEventsTypeEnum : typeof DeviceEventsTypeEnum = DeviceEventsTypeEnum
  
  dangerousUrl;
  trustedUrl;

  constructor(private notiService: EventSourceService,private sanitizer: DomSanitizer) 
  {
    this.dangerousUrl = 'javascript:alert("Hi there")';
    this.trustedUrl = sanitizer.bypassSecurityTrustUrl(this.dangerousUrl);
  }

  fetchStream(): void 
  {
    this.messageEvents = this.notiService.getServerSentEvent("http://localhost:5000/api/cliente/Streaming")
  }

  ngOnInit(): void 
  {
    this.fetchStream();
    this.Subscribe();
  }

  ngAfterViewInit() : void 
  {
  }

  ngOnDestroy(): void 
  {
    this.isalive = false;
    
    this.UnSubscribe();
    //this.eventsSubscription.unsubscribe();
    
  }

  PlayPause() : void
  {
    this.isalive = !this.isalive;
    
    if (this.messageEvents) 
    {
      if(this.isalive)
      {
        this.Subscribe();
      }
      else
      {
        this.UnSubscribe();
      }
    }
  }

  Clear() : void
  {
    this.deviceEvents = [];
  }

  Subscribe() : void
  {

    if (this.messageEvents)
    {
      //All events
      this.eventsSubscription = this.messageEvents
      //.takeWhile(() => this.isalive)
      //.sampleTime(500) //rate of display msg on browser
      .subscribe((event : MessageEvent) => {
                            //console.log(event);
                            this.events.push(event); //Cant parse event as Json format - not in json format
                         },
                err => console.error('Observer got an error: ' + err),
                () => console.log('Observer got a complete notification'));


                
      const likeFilter = this.messageEvents.pipe(filter(event => event.type === DeviceEventsTypeEnum.LIKE)); //handle Like event
      this.likeSubscription = likeFilter.subscribe((event : MessageEvent) => { 
                                                    console.log(DeviceEventsTypeEnum.LIKE);
                                                    this.toggle(); 
                                                  });

      const addFilter = this.messageEvents.pipe(filter(event => event.type === DeviceEventsTypeEnum.ADD)); //handle Add event
      this.addSubscription = addFilter.subscribe((event : MessageEvent) => { 
                                                    console.log(DeviceEventsTypeEnum.ADD);
                                                    let json = JSON.parse(event.data);
                                                    this.deviceEvents.push(new DeviceEvent(json['Id'],json['Nome']));
                                                    this.GetSafeURL(json['Id']);
                                                  });                                                  
    }

  } 

  UnSubscribe() : void
  {
    this.eventsSubscription.unsubscribe();
    this.likeSubscription.unsubscribe();
    this.addSubscription.unsubscribe();
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

  GetSafeURL(nameParam: string) 
  {
    this.dangerousUrl = 'https://picsum.photos/seed/'+nameParam+'/200/300';
    this.trustedUrl = this.sanitizer.bypassSecurityTrustUrl(this.dangerousUrl);
  }

}
