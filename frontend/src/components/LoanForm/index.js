import { useState } from "react"
import Cookies from 'js-cookie'

const LoanForm = () => {
    const [id, setLoanId] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [amount, setAmount] = useState(0);
    const [term, setTerm] = useState(0); 
    const [status, setStatus] = useState('Pending');
    const [showErr, setShowErr] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const onChangeId = event => {
        setLoanId(event.target.value);
    }

    const onChangeCustomerId = event => {
        setCustomerId(event.target.value);
    }

    const onChangeAmount = event => {
        setAmount(event.target.value);
    }

    const onChangeTerm = event => {
        setTerm(event.target.value)
    }

    const onChangeStatus = event => {
        setStatus(event.target.value);
    }

    const loanFormSubmitFailure = (errMsg) => {
        setShowErr(true);
        setErrMsg(errMsg);
    }

    const loanFormSubmitSuccess = (data) => {
        console.log(data);
    }

    const loanFormSubmit = async event => {
        event.preventDefault();
        const loanDetails = {
            id,
            customerId,
            amount,
            term,
            status
        }
        const jwtToken = Cookies.get('jwt_token');
        const apiUrl = 'http://localhost:3000/loans'
        const options = {
            method: 'POST',
            headers: {
                authoriztion: `Bearer ${jwtToken}`
            },
            body: JSON.stringify(loanDetails)
        }
        const response = await fetch(apiUrl, options);
        const loanData = await response.json();
        if (response.ok === true) {
            loanFormSubmitSuccess(loanData)
        }else{
            loanFormSubmitFailure(loanData.error_msg)
        }
    }

    return (
        <div>
            <div>
                <h1>Loan Form</h1>
            </div>
            <form onSubmit={loanFormSubmit}>
                <div>
                    <label>id:</label>
                    <input type="text" onChange={onChangeId} />
                </div>
                <div>
                    <label>customerId:</label>
                    <input type="text" onChange={onChangeCustomerId} />
                </div>
                <div>
                    <label>amount:</label>
                    <input type="number" onChange={onChangeAmount} />
                </div>
                <div>
                    <label>term:</label>
                    <input type="number" onChange={onChangeTerm} />
                </div>
                <div>
                    <label>status:</label>
                    <input type="text" onChange={onChangeStatus} />
                </div>
                <button type="submit">Submit</button>
                {showErr && <p>* {errMsg}</p>}
            </form>
        </div>
    )
}

export default LoanForm