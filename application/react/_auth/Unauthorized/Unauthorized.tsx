import { useLocation } from "react-router-dom"
import * as flexboxStyles from '@ui/styles/flexbox.module.scss'
import * as styles from './Unauthorized.module.scss'
import clsx from "clsx";

export const Unauthorized = () => {
  const location = useLocation();
  const fromUrl = location.state?.from?.pathname;

  return (
    <div className={clsx(styles.container, flexboxStyles.flexCenterCenterColumn)}>
      <h1>Unauthorized</h1>
      <p>You do not have access to the requested page ("<span className={styles.urlText}>{fromUrl}</span>").</p>
      <p>To gain access, speak with the website administrator.</p>
    </div>
  )
}

export default Unauthorized;
