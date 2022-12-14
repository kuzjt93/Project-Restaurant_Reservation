import React, { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { deleteTable, listReservations, listTable, unSeatingTable } from "../utils/api";
import { previous, next } from "../utils/date-time";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationsList from "../reservations/ReservationsList";
import TableList from "../tables/TableList";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ todayDate }) {
  const history = useLocation();

  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tablesError, setTablesErrors] = useState(null);
  const [date, setDate] = useState(() => {
    if(history.search) {
      return history.search.slice(6,16);
    }
    return todayDate;
  });
  
  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    setTablesErrors(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTable(abortController.signal)
      .then(setTables)
      .catch(setTablesErrors)
    return () => {
      abortController.abort();
    }
  };

  const previousButtonHandler = () => {
    setDate(previous(date.toString()));
  };

  const todayButtonHandler = () => {
    setDate(todayDate);
  };

  const nextButtonHandler = () => {
    setDate(next(date.toString()));
  };
  
  function finishButtonHandler(table_id) {
    if(window.confirm("Is this table ready to seat new guests?\nThis cannot be undone.")) {
      setTablesErrors(null);
      unSeatingTable(table_id)
        .then(() => loadDashboard())
        .catch(setTablesErrors)
    };
  };

  function deleteTableHandler(table_id) {
    if(window.confirm("Are you sure to delete this table?\nThis cannot be undone.")) {
      setTablesErrors(null);
      deleteTable(table_id)
        .then(() => loadDashboard())
        .catch(setTablesErrors)
    };
  };

  return (
    <main>
      <div className="d-flex justify-content-around">
        <h4 className="mb-0 h3 ">Date: {date}</h4>
      </div>
      <div role="group" className="d-flex py-2 btn-group ">
        <button className="btn btn-dark border-right" onClick={previousButtonHandler}>
          Previous day
        </button>
        <button className="btn btn-dark" onClick={todayButtonHandler}>
          Today
        </button>
        <button className="btn btn-dark" onClick={nextButtonHandler}>
          Next day
        </button>
      </div>
      <ErrorAlert error={reservationsError} />
      <ErrorAlert error={tablesError} />
      <section className="row justify-content-between">
        <div className="col-lg-8 py-2">
          {!!reservations.length && 
            <ReservationsList 
              reservations={reservations} 
              setError={setReservationsError}
            />
          }
        </div>
        <div className="col-lg-4 order-first order-lg-2">
          <div id="table" className="carousel slide" data-ride="carousel">
            <div className="carousel-inner">
              { !!tables.length && 
                <TableList
                  tables={tables}
                  unSeatingHandler={finishButtonHandler}
                  deleteTableHandler={deleteTableHandler}
                />
              }
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
