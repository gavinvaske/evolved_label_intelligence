import * as styles from './404.module.scss'

export const PageNotFound = () => {
  return (
    <div className={styles.notFoundPage} data-test='404-page'>
      Page not Found. Verify that the URL you entered is correct. (TODO @Storm: Make this 404 page pretty)
    </div>
  )
}

export default PageNotFound;