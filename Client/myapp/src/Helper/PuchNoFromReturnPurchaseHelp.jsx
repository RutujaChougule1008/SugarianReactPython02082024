import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import DataTableSearch from "../Common/HelpCommon/DataTableSearch";
import DataTablePagination from "../Common/HelpCommon/DataTablePagination";
import axios from "axios";
import "../App.css";

var lActiveInputFeild = "";
const CompanyCode = sessionStorage.getItem("Company_Code")
const API_URL = process.env.REACT_APP_API;
const Year_Code = sessionStorage.getItem("Year_Code");

const PuchNoFromReturnPurchaseHelp = ({ onAcCodeClick, name, purchaseNo,disabledFeild,tabIndexHelp}) => {

    const [showModal, setShowModal] = useState(false);
    const [popupContent, setPopupContent] = useState([]);
    const [enteredAcCode, setEnteredAcCode] = useState("");
    const [type, setType] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedRowIndex, setSelectedRowIndex] = useState(-1);
    const [apiDataFetched, setApiDataFetched] = useState(false);

    // Fetch data based on acType
    const fetchAndOpenPopup = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/sugarian/PurcNoFromReturnPurchase?Company_Code=${CompanyCode}&Year_Code=${Year_Code}`);
            const data = response.data;
            const filteredData = data.filter(item => 
                item.PartyName.toLowerCase().includes(searchTerm.toLowerCase())||
                item.MillName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setPopupContent(filteredData);
            setShowModal(true);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                await fetchAndOpenPopup();
                setShowModal(false);
                setApiDataFetched(true);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        if (!apiDataFetched) {
            fetchData();
        }

    }, [apiDataFetched]);

    // Handle Mill Code button click
    const handleMillCodeButtonClick = () => {
        lActiveInputFeild=name
        fetchAndOpenPopup();
        if (onAcCodeClick) {
            onAcCodeClick({ enteredAcCode });
        }
    };

    //popup functionality show and hide
    const handleCloseModal = () => {
        setShowModal(false);
    };

    //handle onChange event for Mill Code,Broker Code and Bp Account
    const handleAcCodeChange = async (event) => {
        const { value } = event.target;
        setEnteredAcCode(value);


        try {
            // Assuming `apiURL` is defined somewhere in your code
            const response = await axios.get(`http://localhost:8080/api/sugarian/PurcNoFromReturnPurchase?Company_Code=${CompanyCode}&Year_Code=${Year_Code}`);
            const data = response.data;
            setPopupContent(data);
            setApiDataFetched(true);

            const matchingItem = data.find((item) => item.doc_no === parseInt(value, 10));

            if (matchingItem) {
              
                setEnteredAcCode(matchingItem.doc_no);
                setType(matchingItem.Tran_Type)
                

                
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    //After open popup onDoubleClick event that record display on the feilds
    const handleRecordDoubleClick = (item) => {
        if (lActiveInputFeild === name) {
            setEnteredAcCode(item.doc_no);
            setType(item.Tran_Type)
           

            if (onAcCodeClick) {
                onAcCodeClick(item.doc_no);
            }
        }

        setShowModal(false);
    };

    //handle pagination number
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    //handle search functionality
    const handleSearch = (searchValue) => {
        setSearchTerm(searchValue);
    };

    const filteredData = popupContent.filter((item) =>
        item.PartyName && item.PartyName.toLowerCase().includes(searchTerm.toLowerCase())

    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToDisplay = filteredData.slice(startIndex, endIndex);

    // Handle key events
    useEffect(() => {
        const handleKeyEvents = async (event) => {
            if (event.key === "F1") {
                if (event.target.id === name) {
                    lActiveInputFeild = name
                    fetchAndOpenPopup();
                    event.preventDefault();
                }
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelectedRowIndex((prev) => Math.max(prev - 1, 0));
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelectedRowIndex((prev) =>
                    Math.min(prev + 1, itemsToDisplay.length - 1)
                );
            } else if (event.key === "Enter") {
                event.preventDefault();
                // Check if a row is selected
                if (selectedRowIndex >= 0) {
                    handleRecordDoubleClick(itemsToDisplay[selectedRowIndex]);
                }
                setSelectedRowIndex(-1);
            }
        };

        window.addEventListener("keydown", handleKeyEvents);

        return () => {
            window.removeEventListener("keydown", handleKeyEvents);
        };
    }, [selectedRowIndex, itemsToDisplay, name, fetchAndOpenPopup, handleRecordDoubleClick]);


    return (
        <div className="d-flex flex-row ">
            <div className="d-flex ">
                <div className="d-flex">
                    <input
                       
                        type="text"
                        className="form-control ms-2"
                        id={name}
                        autoComplete="off"
                        value={enteredAcCode !== '' ? enteredAcCode : purchaseNo}
                        onChange={handleAcCodeChange}
                        style={{ width: "150px", height: "35px" }}
                        disabled={disabledFeild}
                        tabIndex={tabIndexHelp}

                    />
                    <Button
                      
                        variant="primary"
                        onClick={handleMillCodeButtonClick}
                        className="ms-1"
                        style={{ width: "30px", height: "35px" }}
                        disabled={disabledFeild}
                        tabIndex={tabIndexHelp}
                    >
                        ...
                    </Button>
                    <label id="nameLabel" className="form-labels ms-2">
                        {type}
                    </label>
                </div>
            </div>
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                dialogClassName="modal-dialog"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Popup</Modal.Title>
                </Modal.Header>
                <DataTableSearch data={popupContent} onSearch={handleSearch} />
                <Modal.Body>
                    {Array.isArray(popupContent) ? (
                        <div className="table-responsive">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Doc_no</th>
                                        <th>Date</th>
                                        <th>Tran Type</th>
                                        <th>Mill Name</th>
                                        <th>Quintal</th>
                                        <th>Party Name</th>
                                        <th>Bill Amount</th>
                                        <th>Year Code</th>
                                        <th>Sale Id</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {itemsToDisplay.map((item, index) => (
                                        <tr
                                            key={index}
                                            className={
                                                selectedRowIndex === index ? "selected-row" : ""
                                            }
                                            onDoubleClick={() => handleRecordDoubleClick(item)}
                                        >
                                            <td>{item.doc_no}</td>
                                            <td>{item.doc_date}</td>
                                            <td>{item.Tran_Type}</td>
                                            <td>{item.MillName}</td>
                                            <td>{item.Quantal}</td>
                                            <td>{item.PartyName}</td>
                                            <td>{item.Bill_Amount}</td>
                                            <td>{item.Year_Code}</td>
                                            <td>{item.saleid}</td>

                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        "Loading..."
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <DataTablePagination
                        totalItems={filteredData.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                    />
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PuchNoFromReturnPurchaseHelp;