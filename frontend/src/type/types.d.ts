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
    }[]
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
    id : string,
    judul: null|string,
    name: string,
    nrp: string,
    code : string|null,
    group: string,
}