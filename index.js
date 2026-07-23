let interviews = []
let storageData = JSON.parse(localStorage.getItem("interviews"))

if (storageData) {
    interviews = storageData
}

function storage() {
    localStorage.setItem("interviews", JSON.stringify(interviews))
}

function refreshUI() {
    render(interviews);
    updateCards();
    upcoming();
    storage();
}
refreshUI()

$(function () {

})

function addrow(id, company, role, interviewDate, status) {
    let row = (`<tr>            
            <td>${company}</td>
            <td>${role}</td>
            <td>${interviewDate}</td>
            <td>
            <div class="status ${getStatusClass(status)}">${status}</div>
            </td>
            <td>
            <div class="d-flex align-items-center justify-content-between">
            <button class="editBtn bg-transparent" onClick="editBtn(${id},this)"><i class=" action-icons-edit bi bi-pen"></i></button>
           <button onclick="deleterow(${id},this)" class="deleteBtn bg-transparent"><i class="bi bi-trash3"></i></button>
            </div>
            </td>
            </tr>`)
    $("#table-data").append(row)

}

$(`.createInterview`).click(function (event) {
    event.preventDefault();
    let idvalue = interviews.length + 1;
    let companyValue = $(`#companyName`).val()
    let roleValue = $(`#interviewRole`).val()
    let interviewDate = $("#interviewDate").val();
    let stausValue = $(`#interviewStatus`).val()

    const errors = []
    // Check for input validations and errors
    if (!companyValue) {
        errors.push("Company name is required")
    }
    if (!roleValue) {
        errors.push("Role is required")
    }
    if (new Date(interviewDate) < new Date()) {
        errors.push("Interview date cannot be in the past")
    }
    const errorContainer = $("#form-error")
    errorContainer.empty()
    if (errors.length) {
        errors.forEach(error => {
            errorContainer.append(`<p>${error}</p>`)
        })
        errorContainer.addClass('show')
        return // Returning early since we have errors and not creating record
    } else {
        errorContainer.removeClass('show')
    }


    let interviewData = {
        id: idvalue,
        company: companyValue,
        role: roleValue,
        interviewDate: interviewDate,
        status: stausValue || "Applied"
    }
    if (editingId === null) {
        interviews.push(interviewData);
        storage()

    } else {
        let interview = interviews.find(item => item.id === editingId);

        if (interview) {
            interview.company = companyValue;
            interview.role = roleValue;
            interview.interviewDate = interviewDate;
            interview.status = stausValue;
        }
        editingId = null;
    }
    render(interviews);
    updateCards();
    upcoming();

    $("#companyName").val("");
    $("#interviewRole").val("");
    $("#interviewDate").val("");
    $("#interviewStatus").val("");
})
function deleterow(id, element) {
    // let id = $(element).attr("data-id")
    interviews = interviews.filter(item => item.id != id)
    console.log(id, interviews)
    $(element).parent().parent().parent().remove()
    updateCards();
    upcoming();
    storage()

}
let editingId = null;
function editBtn(id, element) {
    let edit = interviews.find(item => item.id === id);
    if (edit) {
        editingId = id;

        $("#companyName").val(edit.company);
        $("#interviewRole").val(edit.role);
        $("#interviewDate").val(edit.interviewDate.split("T")[0]);
        $("#interviewStatus").val(edit.status);

        $(".createInterview").addClass("d-none");
        $(".updateInterview").removeClass("d-none");
    }
    updateCards();
    upcoming();
    storage()

}

$(".updateInterview").click(function () {

    let interview = interviews.find(item => item.id === editingId);

    if (!interview) return;

    interview.company = $("#companyName").val();
    interview.role = $("#interviewRole").val();
    interview.interviewDate = $("#interviewDate").val();
    interview.status = $("#interviewStatus").val();

    refreshUI();

    editingId = null;

    $("form")[0].reset();

    $(".updateInterview").addClass("d-none");
    $(".createInterview").removeClass("d-none");
});


function render(interviews) {
    $("#table-data").empty()
    interviews.forEach((element) => {
        addrow(element.id, element.company, element.role, element.interviewDate, element.status)
    })
}
$(".companyname-search-input").on("input", function (event) {
    // let currentInterviews = [...interviews]
    let searchText = event.target.value.toLowerCase()

    if (searchText === "") {
        render(interviews)

    }
    else {
        let filterByCompany = interviews.filter(item =>
            item.company.toLowerCase().includes(searchText) ||
            item.role.toLowerCase().includes(searchText) ||
            item.status.toLowerCase().includes(searchText)
        );
        render(filterByCompany)
    }
})


function Card(id, icon, iconClass, title, value, description) {

    return `
    <div id="${id}" class="card shadow border-0 p-3">
        <div class="d-flex justify-content-between align-items-center">

            <div class="d-flex gap-3">

                <div class="${iconClass} rounded shadow p-3">
                    <i class="bi  ${icon}"></i>
                </div>

                <div>
                    <h6>${title}</h6>

                    <h3 class="card-value">${value}</h3>

                    <small class="fw-semibold card-icon-description">${description}</small>
                </div>

            </div>

            <i class="bi card-offers-icon-img bi-arrow-up-right"></i>

        </div>
    </div>
    `;
}
let total = interviews.length
let today = new Date();
today.setHours(0, 0, 0, 0);
let next7Days = new Date(today);
next7Days.setDate(today.getDate() + 7);
let upcomingData = interviews.filter(item => {
    let interviewDate = new Date(item.interviewDate);
    return interviewDate >= today && interviewDate <= next7Days;
});

let offer = interviews.filter(item => item.status === "Completed").length
let rejection = interviews.filter(item => item.status === "Rejected").length

$(".card-interview").append(
    Card(
        "total-interviews",
        "bi-briefcase card-brief-icon-img",
        "card-brief-icon",
        "Total Interview",
        total,
        "All Time"),
    Card(
        "upcoming-interview",
        "bi-calendar-week card-calendar-icon-img",
        "card-calendar-icon",
        "Upcoming Interview",
        upcomingData.length,
        "Next 7 days"),
    Card(
        "offers",
        "bi-trophy card-offers-icon-img ",
        "card-offers-icon",
        "Offers",
        offer,
        "This Year"),

    Card(
        "rejected",
        "bi-x-circle card-rejected-icon-img ",
        "card-rejected-icon",
        "Rejection",
        rejection,
        "This Year"),

)

function updateCard(id, value) {
    $("#" + id).find(".card-value").text(value)
}
function getUpcomingCount() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    return interviews.filter(item => {
        let date = new Date(item.interviewDate);
        return date >= today && date <= next7Days;
    }).length;
}
function updateCards() {
    updateCard("total-interviews", interviews.length);
    updateCard("upcoming-interview", getUpcomingCount());
    updateCard("offers", interviews.filter(item => item.status === "Completed").length);
    updateCard("rejected", interviews.filter(item => item.status === "Rejected").length);
}
function upcoming() {

    $(".upcomingSchedules").empty();


    let today = new Date();
    today.setHours(0, 0, 0, 0);

    let next7Days = new Date(today);
    next7Days.setDate(today.getDate() + 7);

    let upcomingData = interviews.filter(item => {
        let interviewDate = new Date(item.interviewDate);

        return interviewDate >= today && interviewDate <= next7Days;
    });

    upcomingData.forEach(item => {
        $(".upcomingSchedules").append(`
            <div class="upcoming-item">
             <div>
              <div class="upcoming-company">${item.company}</div>
              <div class="upcoming-role">${item.role}</div>
             </div>
              <div class="upcoming-date">${item.interviewDate.split("T")[0]}
              </div>
             </div>`);

        if (upcomingData.length === 0) {

            $(".upcomingSchedules").html(`
        <div class="empty-upcoming">
            🎉 No upcoming interviews this week
        </div>
    `);

            return;

        }
    });

}
upcoming()
function getStatusClass(status) {

    switch (status) {

        case "Completed":
            return "status-completed";

        case "Rejected":
            return "status-rejected";

        case "Scheduled":
            return "status-scheduled";

        case "Technical Round":
            return "status-technical";

        case "Hr Round":
            return "status-hr";

        default:
            return "status-applied";
    }
}


























