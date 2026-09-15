export interface PageMeta {
	title: string;
	description: string;
	group: string;
	order: number;
	/** Route path, derived from the file location. */
	href: string;
}

export interface NavGroup {
	/** Zero-padded display index, e.g. "01". */
	index: string;
	label: string;
	pages: PageMeta[];
}
