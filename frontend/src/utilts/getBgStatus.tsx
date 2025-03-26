export const getBackgroundColor = (status: string|undefined): string => {
      if (status === "UNSCHEDULED") return " bg-gray-400 hover:bg-gray-400 ";
      else if(status === "SCHEDULED") return " bg-blue-500 hover:bg-blue-500 "; 
      else if(status === "FINISHED") return " bg-lime-500 hover:bg-lime-500 ";
      else if(status === "COMPLETED") return " bg-green-500 hover:bg-green-500 "; 
      else if(status === "CANCELLED") return " bg-red-500 hover:bg-red-500 "; 
      else return " bg-muted-foreground "; 
}

export const getTextColorScheduleStatus = (status: string|undefined): string => {
      if (status === "UNSCHEDULED") return " text-gray-400 hover:text-gray-400 ";
      else if(status === "SCHEDULED") return " text-blue-500 hover:text-blue-500 "; 
      else if(status === "FINISHED") return " text-lime-500 hover:text-lime-500 ";
      else if(status === "COMPLETED") return " text-green-500 hover:text-green-500 "; 
      else if(status === "CANCELLED") return " text-red-500 hover:text-red-500 "; 
      else return " text-muted-foreground "; 
}

export const getBgColorAttd = (status : string|undefined) : string => { 
      if (status ===  'HADIR') return 'bg-green-500 hover:bg-green-500';
      if(status ===   'SAKIT') return 'bg-yellow-500 hover:bg-yellow-500';
      if(status ===   'IZIN') return 'bg-orange-500 hover:bg-orange-500';
      if(status ===   'TIDAK_HADIR') return 'bg-red-500 hover:bg-red-500';
      else return 'bg-muted-foreground'    
} 