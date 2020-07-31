//event: Insert id: 4feae55b-0984-44ca-b1a6-beb5dea24459 data: {"Id":13000,"Nome":"Nome 13000"}

export class DeviceEvent 
{
    Id: number;
    Nome: string;
    
    //lastEventId: string;
    //data: string;
    
  
    constructor(Id: number, Nome: string) //, data: string, lastEventId: string
    {
      this.Id = Id;
      this.Nome = Nome
      //this.lastEventId = lastEventId;
      //this.data = data;
    }
}