import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { BoardProps } from '@/@types/board'
import { api } from '@/lib/axios'

interface BoardsState {
  boards: BoardProps[] | null
  activeBoard: BoardProps | undefined
  enableScrollFeature: boolean
  isValidatingBoards: boolean
  isValidatingActiveBoard: boolean
}

const initialState: BoardsState = {
  boards: null,
  activeBoard: undefined,
  enableScrollFeature: false,
  isValidatingBoards: false,
  isValidatingActiveBoard: false,
}

export const fetchBoards = createAsyncThunk('boards/fetchBoards', async () => {
  const response = await api.get<{ boards: BoardProps[] }>('/boards')
  console.log('[fetchBoards] response:', response.data.boards?.map((b) => ({ id: b.id, name: b.name })))
  return response.data.boards
})

export const fetchActiveBoard = createAsyncThunk(
  'boards/fetchActiveBoard',
  async () => {
    const response = await api.get<{ board: BoardProps }>('/boards/active')
    const board = response.data.board
    console.log('[fetchActiveBoard] response:', {
      boardId: board?.id,
      boardName: board?.name,
      columns: board?.columns?.map((c) => ({
        id: c.id,
        name: c.name,
        taskCount: c.tasks?.length ?? 0,
      })),
    })
    return board
  },
)

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards(state, action: { payload: BoardProps[] | null }) {
      state.boards = action.payload
    },
    setActiveBoard(state, action: { payload: BoardProps | undefined }) {
      state.activeBoard = action.payload
    },
    setEnableScrollFeature(state, action: { payload: boolean }) {
      state.enableScrollFeature = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.isValidatingBoards = true
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.isValidatingBoards = false
        state.boards = action.payload ?? []
      })
      .addCase(fetchBoards.rejected, (state) => {
        state.isValidatingBoards = false
        state.boards = []
      })

      .addCase(fetchActiveBoard.pending, (state) => {
        state.isValidatingActiveBoard = true
      })
      .addCase(fetchActiveBoard.fulfilled, (state, action) => {
        state.isValidatingActiveBoard = false
        // só sobrescreve se a API retornou um board válido
        if (action.payload) {
          state.activeBoard = action.payload
        }
      })
      .addCase(fetchActiveBoard.rejected, (state) => {
        state.isValidatingActiveBoard = false
        // não limpa o board em caso de erro — mantém o último estado conhecido
      })
  },
})

export const { setBoards, setActiveBoard, setEnableScrollFeature } =
  boardsSlice.actions
export default boardsSlice.reducer
