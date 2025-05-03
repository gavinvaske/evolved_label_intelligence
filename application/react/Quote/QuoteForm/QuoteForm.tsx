import QuoteHeader from './QuoteHeader/QuoteHeader';
import CostSummary from './CostSummary/CostSummary';
import InputSection from './InputSection/InputSection';
import OutputSection from './OutputSection/OutputSection';
import axios from 'axios';
import './QuoteForm.scss';
import quoteStore from '../../stores/quoteStore'
import { Button } from '../../_global/Button/Button';

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
        <Button color='blue' size='large' onClick={generateQuotes}><i className="fa-duotone fa-bullseye"></i></Button>
        <QuoteHeader />
        <CostSummary />
        <InputSection />
        <OutputSection />
      </div>
    </div>
  );
};

export default QuoteForm;