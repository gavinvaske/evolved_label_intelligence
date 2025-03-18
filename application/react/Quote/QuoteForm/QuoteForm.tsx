import React from 'react';
import QuoteHeader from './QuoteHeader/QuoteHeader';
import CostSummary from './CostSummary/CostSummary';
import InputSection from './InputSection/InputSection';
import OutputSection from './OutputSection/OutputSection';
import axios from 'axios';
import './QuoteForm.scss';
import quoteStore from '../../stores/quoteStore'
import * as sharedStyles from '@ui/styles/shared.module.scss'
import * as formStyles from '@ui/styles/form.module.scss'

const QuoteForm = () => {
  const generateQuotes = (e) => {
    axios.post('/quote', quoteStore.quoteInputs)
      .then((response) => {
        const { data } = response;
        quoteStore.quotes = data;
      })
      .catch((error) => {
        alert(`Error: ${error.response.data}`);
      })
  }
  return (
    <div className='quote-page-wrapper'>
      <div id='quote-form' data-test='quote-form'>
        <button className='btn-primary temp-button-class flex-center-center-row' onClick={generateQuotes}><i className="fa-duotone fa-bullseye"></i></button>
        <QuoteHeader />
        <CostSummary />
        <InputSection />
        <OutputSection />
      </div>
    </div>
  );
};

export default QuoteForm;