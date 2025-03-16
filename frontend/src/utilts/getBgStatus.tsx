export const getBackgroundColor = (status: string|undefined): string => {
      if (status === "UNSCHEDULED") return " bg-gray-300 hover:bg-gray-400 ";
      else if(status === "SCHEDULED") return " bg-cyan-400 hover:bg-sky-500 ";
      else if(status === "FINISHED") return " bg-blue-400 hover:bg-blue-500 "; 
      else if(status === "COMPLETED") return " bg-green-400 hover:bg-green-500 "; 
      else if(status === "CANCELLED") return " bg-red-400 hover:bg-red-500 "; 
      else return " bg-muted-foreground "; 
}