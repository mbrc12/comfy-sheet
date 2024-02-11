import { marked } from "marked";
import { load as toml } from "js-toml";

import tomlData from "./content/data.toml?raw"
import tomlWisdom from "./content/wisdom.toml?raw"

const BASEURL = "https://docs.rs/comfy/latest/comfy/"

export type Kind =
    "macro" |
    "struct" |
    "enum" |
    "constant" |
    "static"|
    "trait" |
    "fn" |
    "type" |
    "union" |
    "method" |
    "tymethod"

export interface Entry {
    name: string,
    kind: Kind,
    type: string,
    description: string,
    show_url?: boolean,

    submodule?: string,
    defined_on?: Entry
}

export function isItem(entry: Entry): entry is Entry {
    return (<Entry>entry).kind !== undefined;
}

export type Data = {
    [name: string]: Entry[]
}

export type Wisdom = {
    [section: string]: string
}

export type SearchableEntry = {
    // search_contents: string,
    section: string,
    entry: Entry
}


export function url(item: Entry): string {
    let result = item.defined_on ? url(item.defined_on) : BASEURL;
    
    if (item.submodule) {
        result = result + `${item.submodule}/`
    }

    if (item.kind == "method" || item.kind == "tymethod") {
        return result + `#${item.kind}.${item.name}`
    } else {
        return result + `${item.kind}.${item.name}.html`
    }
}

export function preprocessEntryForSearch(section: string, item: Entry): SearchableEntry {
    
    // let contents = `${section} %%% ${item.name} %%% ${item.type} %%% ${item.description}`;
    // console.log(contents);

    return {
        // search_contents: contents,
        section: section,
        entry: item
    }
}

export function searchableEntriesFromData(data: Data): SearchableEntry[] {
    return Object.keys(data).flatMap((section) => {
        let items = data[section];
        return items.map((item) => preprocessEntryForSearch(section, item));
    })
}

export function groupBySection(entries: SearchableEntry[]): Data {
    let data: any = {};
    entries.forEach(({section, entry}) => {
        if (data[section] == null) {
            data[section] = []
        }
        data[section].push(entry)
    });

    return <Data>data;
}

// FIX SUBMODULES

export const DATA: Data = ((data: Data) => {
    Object.entries(data).forEach(([_section, items]) => {
        items.forEach((it: Entry) => {
            let parsed = <string>marked.parse(it.description);
            it.description = parsed;
        })
    });
    return data;
})(<Data>toml(tomlData))

export const WISDOM: Wisdom = ((wisdom) => {
    let result: any = {};
    Object.entries(wisdom).forEach(([section, text]) => {
        let parsed = <string>marked.parse(text);
        result[section] = parsed;
    });
    return result;
})(toml(tomlWisdom));
