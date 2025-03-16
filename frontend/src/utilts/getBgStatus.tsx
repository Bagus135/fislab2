export const getBackgroundColor = (status: string|undefined): string => {
      if (status === "UNSCHEDULED") return " bg-gray-400 hover:bg-gray-400 ";
      else if(status === "SCHEDULED") return " bg-cyan-500 hover:bg-cyan-500 ";
      else if(status === "FINISHED") return " bg-blue-500 hover:bg-blue-500 "; 
      else if(status === "COMPLETED") return " bg-green-500 hover:bg-green-500 "; 
      else if(status === "CANCELLED") return " bg-red-500 hover:bg-red-500 "; 
      else return " bg-muted-foreground "; 
}