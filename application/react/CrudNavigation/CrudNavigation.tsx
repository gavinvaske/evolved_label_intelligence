import './CrudNavigation.scss';

export const CrudNavigation = () => {

  return (

    <div className='crud-navigation-page'>
      <div className='container'>
          <div className='left-panel-card card'>
            <div className='header'>
              <div className='left'>
                Create
              </div>
              <div className='right'>
                  <i className="fa-solid fa-plus"></i>
              </div>
            </div>
            <div className='body'>
              <div className='create-button-frame'>
                <div className='hover-frame'>
                  <i className="fa-solid fa-plus"></i>
                  Create Ticket
                </div>
              </div>
              <div className='create-button-frame'>
                <div className='hover-frame'>
                  <i className="fa-solid fa-plus"></i>
                  Create Quote
                </div>
              </div>
              <div className='create-button-frame'>
                <div className='hover-frame'>
                  <i className="fa-solid fa-plus"></i>
                  Create Product
                </div>
              </div>
              <div className='create-button-frame'>
                <div className='hover-frame'>
                  <i className="fa-solid fa-plus"></i>
                  Create Customer
                </div>
              </div>
              <div className='create-button-frame'>
                <div className='hover-frame'>
                  <i className="fa-solid fa-plus"></i>
                  Create Die
                </div>
              </div>
              <div className='create-button-frame'>
                <div className='hover-frame'>
                  <i className="fa-solid fa-plus"></i>
                  Create P.O.
                </div>
              </div>
              <div className='create-button-frame'>
                <div className='hover-frame'>
                  <i className="fa-solid fa-plus"></i>
                  Create Plate
                </div>
              </div>
            </div>
          </div>

          <div className='left-panel-card card'>
            <div className='header'>
              <div className='left'>
                View
              </div>
              <div className='right'>
                <i className="fa-solid fa-eye"></i>
              </div>
            </div>
            <div className='body'>
              <div className='create-button-frame'>
                <i className="fa-solid fa-plus"></i>
                View Ticket
              </div>
              <div className='create-button-frame'>
                <i className="fa-solid fa-plus"></i>
                View Quote
              </div>
              <div className='create-button-frame'>
                <i className="fa-solid fa-plus"></i>
                View Product
              </div>
              <div className='create-button-frame'>
                <i className="fa-solid fa-plus"></i>
                View Customer
              </div>
              <div className='create-button-frame'>
                <i className="fa-solid fa-plus"></i>
                View Die
              </div>
              <div className='create-button-frame'>
                <i className="fa-solid fa-plus"></i>
                View P.O.
              </div>
              <div className='create-button-frame'>
                <i className="fa-solid fa-plus"></i>
                View Plate
              </div>
            </div>
          </div>

          <div className='left-panel-card card'>
            <div className='header'>
              <div className='left'>
                Order
              </div>
              <div className='right'>
                  <i className="fa-solid fa-plus"></i>
              </div>
            </div>
            <div className='body'>
              <div className='create-button-frame'>
                <i className="fa-solid fa-plus"></i>
                Order Die
              </div>
              <div className='create-button-frame'>
                <i className="fa-solid fa-plus"></i>
                Order Plate
              </div>
            </div>
          </div>

        </div>
    </div>

  )
}

export default CrudNavigation;