type AllUserTypes = {
    id : 'string',
    name : 'string '
    nrp : 'string '
    role : role
} 

type RejectPromiseType = {
    error : string
}


enum role {
    'SUPER_ADMIN',
    'ADMIN',
    'ASISTEN',
    'PRAKTIKAN',
}

type DetailProfileType = {
    profile_picture : string
	"about": string,
	"email": string,
	"id": string,
	"name": string,
	"nrp": string,
	"phone": string,
	"role": string
}

type AllAnnouncementType = {
    author : string,
    content : string,
    created_at : Date,
    id : number,
    title : string,
    updated_at : Date
}

type GetSelfProfileType ={
    profile_picture : string
	about: string,
	email: string,
	id: string,
	name: string,
	nrp: string,
	phone: string,
	role: string,
    email_verified : boolean,
}

type getModul = {
    code : string,
    title : string,
    description : string,
    createdAt : string,
    updatedAt : string,
};

type getPractican = {
    role : role,
	total: number,
	users : {
			id: string,
			name: string,
			nrp: string
    }[] | null
}

type getPracticanGroup = {
    id: string,
    kelompok: number,
    members: {
            id: string,
            nrp: string,
            name: string,
        }[],
}

type getAllAssistant = {
    code : string|null,
    group: string|null,
    id : string,
    judul: null|string,
    name: string,
    nrp: string,
    weeks : string[] | null
}

type AllScheduleAdmin = {
		assistant: {
			id: string,
			name: string,
			nrp: string
		},
		group: {
			group: number,
			id: string,
            week: number
		},
		practicum: {
			code: string,
			title: string
		},
		schedule: {
			date: string,
			id: number,
			startTime: string,
			status : string,
		}
}

type getPracticanSchedules = {
    assistant: {
        id: string,
        name: string,
        nrp: string,
    },
    group: {
        id: string,
        name:number
    },
    id: number,
    practicum: {
        code: string,
        title:string
    },
    schedule: {
        date: string,
        status: string,
        time: string,
        week: number
    }
}

type getAssistantSchedules = {
    group: number,
    groupId: string,
    id: number,
    practicum: {
        code: string,
        title: string
    },
    schedule: {
        date: string,
        status: string,
        time: string,
        week: number
    }
}

type CheckScheduleType = {
    assistantName: string,
    code:string,
    date: string,
    group: number,
    practicum: string,
    time: string
}

type AllGradeAslab = {
    group : number,
    members: {
            gradedAt: string| null,
            gradeId : number|null,
            name: string ,
            nrp: string,
            totalScore: null|number,
            id : string
        }[], 
    practicum: {
        code: string,
        title: string
    },
    scheduleId: number,
    week: number
}

type AllGradePractican = {
    assistant: {
        id : string,
        name: string,
        nrp: string
    },
    code: string,
    gradeId: number,
    gradedAt: Date,
    title: string,
    totalScore: number
}


type  GetDetailedScoreType = {
    assistant : {
        name : string,
        nrp : string
    }, 
    feedback : string,
    gradeId : number,
    gradedAt : Date,
    practicum : {
        id : string,
        title : string,
    }
    scores : {
        inlab : {
            skillsAndAttitude : number,
            total : 0 
        },
        postlab : {
            abstract : number,
            conclusion : number,
            dataProcessing : number,
            discussion : number,
            formatting : number,
            introduction : number,
            methodology : number,
            total : number,
        },
        prelab : {
            oralTest : number,
            preExam : number,
            punctuality : number,
            total : number,
        },
        totalScore : number,
    }
}

type getNearestSchedule = {
    assistantName: string,
    code: string,
    date: string,
    group: number,
    practicum: string,
    time: string,
}

enum AttendanceStatus {
    'HADIR',
    'SAKIT',
    'IZIN',
    'TIDAK_HADIR',
  }

  type statAttendanceType = {
    "attendanceDetails":{
			"date": string,
			"scheduleId": number,
			"status": string,
			"title": string
		}[] | [],
	"summary": {
		"HADIR": number,
		"IZIN": number,
		"SAKIT": number,
		"TIDAK_HADIR": number
	}
  }

type AssistantStatus = {
    'id' : string,
    "code": string,
    "name": string,
    "progress": string,
    "title": string,
}

type AllPracticanGrade = {
    "id": string,
    "nama": string,
    "nrp": string,
    "nilai": {
        [k : string] : number
    }
}[];

type AssistantStatusDetail = {
    assistant : {
        id : string,
        name  : string,
        nrp : string,
    },
    groups : {
        [k : number] : boolean
    } | []
    progress : string
}