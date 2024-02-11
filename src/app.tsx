import Fuse from 'fuse.js';
import { useReducer } from 'preact/hooks'

import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github-dark.css';
import rust from 'highlight.js/lib/languages/rust';
hljs.registerLanguage("rust", rust);

import { DATA, WISDOM } from './data';
import { Data, Entry, groupBySection, searchableEntriesFromData, url } from './data';

const SEARCHABLE_DATA = searchableEntriesFromData(DATA);
const FUSE = new Fuse(SEARCHABLE_DATA, {
    ignoreLocation: true,
    threshold: 0.2,
    keys: ["section", "entry.name", "entry.type", "entry.description"]
})


function EntryComponent(props: any) {
    let entry: Entry = props.entry;
    let entry_url = url(entry);

    let rendered_signature = hljs.highlight(`${entry.type}`, { language: "rust" }).value;

    let name_html = 
        (entry.show_url == undefined || entry.show_url != false)
        ? (<a href={entry_url} class="text-xl">{entry.name}</a>) 
        : (<span class="text-xl">{entry.name}</span>);

    return (
        <tr class="hover text-lg">
            <td>
                {name_html}
            </td>
            <td class="font-mono" dangerouslySetInnerHTML={{ __html: `<pre>${rendered_signature}</pre>` }}></td>
            <td dangerouslySetInnerHTML={{ __html: entry.description }}></td>
        </tr>)
}

function Section(props: { name: string, entries: Entry[] }) {
    let internal = [];
    for (let entry of props.entries) {
        internal.push(<EntryComponent entry={entry} />);
    }

    let wisdom = WISDOM[props.name];

    return (
        <>
            <div tabindex={0} class="collapse my-5 bg-base-200">
                <input type="checkbox" />
                <div class="collapse-title text-3xl font-medium text-primary"> details ... </div>
                <div class="collapse-content text-xl" dangerouslySetInnerHTML={{ __html: wisdom }}>
                </div>
            </div>
            <table class="table table-auto w-full text-left">
                <tr class="text-2xl text-neutral-content"><th>name</th><th>how to call</th><th>description</th></tr>
                {internal}
            </table>
        </>
    )
}

function Table(props: { data: Data }) {
    let data = props.data;

    let html: any = [];

    Object.entries(data).forEach(([section, entries]) => {
        html.push(
            <div class="w-full mb-10">
                <div class="divider divider-neutral text-4xl text-primary italic mb-10">
                    {section}
                </div>
                <Section name={section} entries={entries} />
            </div>
        );
    });

    return html;
}

function searchString(what: string): Data {
    let fuse = FUSE.search(what);
    return groupBySection(fuse.map(it => it.item));
}

export function App() {
    // the action is the string input

    const [data, notifySearchChange] = useReducer((_current, action: string) => {
        return action == "" ? DATA : searchString(action);
    }, DATA);

    const searchChanged = (e: any) => {
        notifySearchChange(e.target.value);
    };

    return (
        <>
            <div class="flex flex-col p-5">
                <div class="flex flex-row w-full gap-10 flex-none p-10">
                    <span class="flex-none text-left text-5xl my-auto text-primary"> reference </span>
                    <input
                        id="searchInput"
                        type="text"
                        onInput={searchChanged}
                        placeholder="press K or / to focus"
                        class="input input-bordered input-lg input-primary grow my-auto"></input>
                </div>
                <div class="grow p-10"> <Table data={data} /> </div>
            </div>

        </>
    )
}

document.body.addEventListener("keydown", focusOnSearch);
function focusOnSearch(ev: KeyboardEvent) {
    let searchbar = document.getElementById("searchInput")!;

    if (document.activeElement === searchbar) {
        return;
    }

    if (ev.key == "K" || ev.key == "k" || ev.key == "/") {
        searchbar.focus()
        ev.preventDefault();
    }
}
