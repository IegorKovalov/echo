import "./Footer.css";

const Footer = () => {
	return (
		<footer className="footer">
			<div className="footer-container">
				<p>
					&copy; {new Date().getFullYear()} Social Network. All rights reserved.
				</p>
				<p>Created by Daniel.F & Iegor.K</p>
			</div>
		</footer>
	);
};

export default Footer;
