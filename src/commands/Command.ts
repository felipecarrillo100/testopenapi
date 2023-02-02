export enum CommandType {
    OpenForm1 = "OpenForm1",
    OpenForm2 = "OpenForm2",
    CreateAnyLayer = "CreateAnyLayer",
    CreateForm = "OpenForm1",
}
export interface Command {
    type: CommandType;
    parameters?: any;
}