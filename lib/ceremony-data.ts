export function getCeremonyTimeDate(ceremony: string) {
    if (ceremony != "noPassportCeremony") {
        return new Date(ceremony.replace("ceremony-", ""));
    } else {
        return new Date(-1);
    }
}

export function getCeremonyTimeString(ceremony: string) {
    let ceremonyDate = new Date();

    if (ceremony != "noPassportCeremony") {
        ceremonyDate = new Date(ceremony.replace("ceremony-", ""));
    } else {
        ceremonyDate = new Date(-1);
    }

    //let cDateString = cMonth + "/" + cDay
    let cDateString = ceremonyDate.toLocaleString('en-US', { day: 'numeric', month: 'numeric' });

    let cTimeString = ceremonyDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    let cCurrentParticipants = 0 // Current Registered Participants
    let cTotalParticipants = 10 // Total Possible Participants

    // Return the concatanated string
    return cDateString + " - " + cTimeString + ": " + (cTotalParticipants - cCurrentParticipants) + "/" + cTotalParticipants + " Slots Available";
}